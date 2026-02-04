import type { Analysis } from "../types";

const post = async (payload: any): Promise<Analysis> => {
  const r = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Erro ao analisar.");
  return data.analysis as Analysis;
};

const extractFramesFromVideo = (file: File, maxFrames: number = 20): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const frames: string[] = [];

    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      let captured = 0;
      const step = video.duration / maxFrames;

      const capture = () => {
        if (captured < maxFrames) {
          video.currentTime = captured * step;
          video.onseeked = () => {
            ctx?.drawImage(video, 0, 0);
            frames.push(canvas.toDataURL("image/jpeg", 0.5).split(",")[1]);
            captured++;
            capture();
          };
        } else {
          URL.revokeObjectURL(video.src);
          resolve(frames);
        }
      };

      capture();
    };

    video.onerror = () => reject("Erro no processamento do vídeo.");
  });
};

export const analyzeFootballMatch = async (input: any): Promise<Analysis> => {
  if (input.type === "file") {
    const frames = await extractFramesFromVideo(input.file);
    return post({ type: "file", frames });
  }

  return post({ type: "url", url: input.url, mode: input.mode });
};
