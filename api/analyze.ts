import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

type GroundingSource = { title: string; uri: string };

const extractYouTubeId = (url: string): string | null => {
  try {
    const u = new URL(url);
    const v = u.searchParams.get("v");
    if (v) return v;

    if (u.hostname.endsWith("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }

    const parts = u.pathname.split("/").filter(Boolean);
    const shortsIdx = parts.indexOf("shorts");
    if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];

    const embedIdx = parts.indexOf("embed");
    if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];

    return null;
  } catch {
    return null;
  }
};

const fetchYouTubeOEmbed = async (
  youtubeUrl: string
): Promise<{ title?: string; author_name?: string } | null> => {
  try {
    const endpoint = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(
      youtubeUrl
    )}`;
    const r = await fetch(endpoint);
    if (!r.ok) return null;
    const data = await r.json();
    return { title: data?.title, author_name: data?.author_name };
  } catch {
    return null;
  }
};

const parseJsonResponse = <T,>(text: string): T | null => {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(text.substring(start, end + 1));
  } catch {
    return null;
  }
};

const normalizeTitle = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ");

const titlesLooselyMatch = (a: string, b: string): boolean => {
  const t1 = normalizeTitle(a);
  const t2 = normalizeTitle(b);
  if (!t1 || !t2) return false;
  return t1 === t2 || t1.includes(t2) || t2.includes(t1);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        "GEMINI_API_KEY não configurada no servidor (Vercel). Adicione a variável e redeploy.",
    });
  }

  try {
    const { type, url, mode, frames } = req.body || {};

    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-3-pro-preview";

    // ===== URL (YouTube) =====
    if ((type ?? "url") === "url") {
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "URL inválida." });
      }

      const expectedVideoId = extractYouTubeId(url);
      if (!expectedVideoId) {
        return res.status(400).json({
          error:
            "Link do YouTube inválido ou sem videoId. Cole a URL completa (ex: https://www.youtube.com/watch?v=XXXX).",
        });
      }

      const oembed = await fetchYouTubeOEmbed(url);
      if (!oembed?.title) {
        return res.status(400).json({
          error:
            "Não foi possível validar esse vídeo pelo YouTube (oEmbed). Verifique se o link está correto e público.",
        });
      }

      const isDetailed = (mode ?? "web") === "video";

      const prompt = `
SISTEMA PROTATICA — PRECISÃO E RASTREABILIDADE (SERVER)

REFERÊNCIA OBRIGATÓRIA:
- LINK DO YOUTUBE (copie exatamente): ${url}
- VIDEO_ID_ESPERADO: ${expectedVideoId}
- METADADOS VERIFICADOS (oEmbed):
  - titulo: ${oembed.title}
  - canal: ${oembed.author_name ?? "indisponivel"}

REGRAS CRÍTICAS:
1) NÃO troque o vídeo por outro. Analise SOMENTE o vídeo com VIDEO_ID_ESPERADO.
2) "videoUrl" deve ser EXATAMENTE o link fornecido (sem encurtar/normalizar/remover parâmetros).
3) "videoId" deve ser exatamente: ${expectedVideoId}
4) "videoTitle" deve corresponder ao título verificado do oEmbed.
5) Se não conseguir identificar a partida com segurança, retorne error (não chute).

DIRETRIZ DE ERRO:
Retorne JSON contendo "error":
"Incapaz de identificar com segurança a partida do vídeo ${url}. Por favor, verifique o link."

MODO: ${isDetailed ? "DETALHADO" : "RÁPIDO"}

SAÍDA (JSON):
{
  "videoTitle": "TÍTULO EXATO DO VÍDEO",
  "videoUrl": "${url}",
  "videoId": "${expectedVideoId}",
  "timeA": "",
  "timeB": "",
  "placar": "",
  "resumoPartida": "",
  "momentosChave": "",
  "contextoPartida": { "competicao":"", "temporada":"", "fase":"", "dataJogo":"", "estadio":"", "cidade":"" },
  "formacoes": { "timeA": { "esquema":"", "titulares":[], "banco":[], "destaquesFuncionais":"" }, "timeB": { "esquema":"", "titulares":[], "banco":[], "destaquesFuncionais":"" } },
  "faseDefensiva": { "timeA": { "posicionamento":"", "compactacao_pressao":"", "transicao":"" }, "timeB": { "posicionamento":"", "compactacao_pressao":"", "transicao":"" } },
  "faseOfensiva": { "timeA": { "saidaDeBola":"", "criacao":"", "finalizacao_movimentacao":"" }, "timeB": { "saidaDeBola":"", "criacao":"", "finalizacao_movimentacao":"" } },
  "estrategiaComportamento": { "controleRitmoAdaptacao":"", "bolasParadas":"" },
  "estatisticas": { "posseDeBola": { "timeA":"", "timeB":"" }, "finalizacoes": { "timeA":"", "timeB":"" }, "finalizacoesNoAlvo": { "timeA":"", "timeB":"" } },
  "pontosFortes": { "timeA": [], "timeB": [] },
  "pontosFracos": { "timeA": [], "timeB": [] },
  "analiseJogadores": [],
  "conclusaoRecomendacoes": "",
  "verificacaoAuditoria": { "partidaIdentificada":"", "fontesPrincipais":[], "observacoes":"", "nivelConfianca":"alta | media | baixa" }
}
`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingBudget: 6000 },
        },
      });

      const analysis = parseJsonResponse<any>(response.text);

      if (!analysis) {
        return res.status(500).json({ error: "Falha ao processar resposta do modelo." });
      }
      if (analysis.error) {
        return res.status(400).json({ error: analysis.error });
      }

      // hard-guards finais
      analysis.videoUrl = url;

      if (!analysis.videoId || analysis.videoId !== expectedVideoId) {
        return res.status(400).json({
          error:
            "Bloqueado: o modelo retornou um vídeo diferente do solicitado (videoId inconsistente).",
        });
      }

      if (
        typeof analysis.videoTitle !== "string" ||
        !titlesLooselyMatch(oembed.title, analysis.videoTitle)
      ) {
        return res.status(400).json({
          error:
            "Bloqueado: o título retornado não corresponde ao vídeo informado (anti troca de vídeo).",
        });
      }

      // fontes
      const sources: GroundingSource[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web && chunk.web.uri) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        });
      }
      analysis.sources = [
        { title: "YouTube (vídeo analisado)", uri: url },
        ...sources,
      ].filter((s, i, arr) => i === arr.findIndex((x) => x.uri === s.uri));

      return res.status(200).json({ analysis });
    }

    // ===== FILE (frames base64) opcional =====
    if (type === "file") {
      if (!Array.isArray(frames) || frames.length === 0) {
        return res.status(400).json({ error: "Frames inválidos." });
      }

      const imageParts = frames.slice(0, 20).map((data: string) => ({
        inlineData: { mimeType: "image/jpeg", data },
      }));

      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              text: `Você é um analista tático. A partir dos frames, identifique a partida e gere um JSON.
Se não for possível identificar com confiança, retorne {"error":"Incapaz de identificar a partida a partir do arquivo."}.`,
            },
            ...imageParts,
          ],
        },
        config: { thinkingConfig: { thinkingBudget: 2000 } },
      });

      const analysis = parseJsonResponse<any>(response.text);
      if (!analysis) return res.status(500).json({ error: "Falha ao processar resposta do modelo." });
      if (analysis.error) return res.status(400).json({ error: analysis.error });

      return res.status(200).json({ analysis });
    }

    return res.status(400).json({ error: "Tipo inválido." });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "Erro interno." });
  }
}
