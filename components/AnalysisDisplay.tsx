import React from 'react';
import type { Analysis, Estatisticas, TeamMetrics } from '../types';
import PossessionChart from './PossessionChart';
import ShotsChart from './ShotsChart';
import HeatmapDisplay from './HeatmapDisplay';

interface AnalysisDisplayProps {
  analysis: Analysis;
}

const AnalysisCard: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
  <div className="bg-[#2a0101]/60 rounded-lg shadow-lg p-6 border border-yellow-900/50 transform transition-transform duration-300 hover:scale-[1.02] hover:border-yellow-700/80 break-inside-avoid print:bg-white print:border print:border-gray-300 print:shadow-none print:transform-none print:text-black print:p-4 print:mb-4">
    <div className="flex items-center mb-4 print:border-b print:border-gray-300 print:pb-2">
      <div className="text-yellow-400 mr-3 print:text-black">{icon}</div>
      <h3 className="text-2xl font-bold text-yellow-100 print:text-black">{title}</h3>
    </div>
    <div className="text-yellow-100/80 leading-relaxed space-y-4 print:text-black">{children}</div>
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="text-xl font-bold text-yellow-400 print:text-black print:font-bold">{children}</h4>
);

const TacticalInfo: React.FC<{ title: string; text?: string }> = ({ title, text }) => {
  if (!text) return null;
  return (
    <div>
      <h5 className="font-semibold text-lg text-yellow-200 print:text-black print:font-bold">{title}</h5>
      <p className="text-yellow-100/80 text-justify print:text-black whitespace-pre-wrap">{text}</p>
    </div>
  );
};

const MiniList: React.FC<{ items?: string[] }> = ({ items }) => {
  if (!items || items.length === 0) return <span className="text-yellow-100/60 print:text-black">—</span>;
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((it, idx) => (
        <li key={idx}>{it}</li>
      ))}
    </ul>
  );
};

const StatisticsTable: React.FC<{ stats: Estatisticas; timeA: string; timeB: string }> = ({ stats, timeA, timeB }) => {
  const statRows: { label: string; key: keyof Omit<Estatisticas, 'mapaDeCalor'> }[] = [
    { label: 'Posse de Bola', key: 'posseDeBola' },
    { label: 'Finalizações', key: 'finalizacoes' },
    { label: 'No Alvo', key: 'finalizacoesNoAlvo' },
    { label: 'Passes Certos', key: 'passesCertos' },
    { label: 'Faltas', key: 'faltasCometidas' },
    { label: 'Desarmes', key: 'desarmes' },
    { label: 'Escanteios', key: 'escanteios' },
    { label: 'Impedimentos', key: 'impedimentos' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-center bg-[#4a0404]/50 rounded-lg print:bg-white print:border print:border-gray-300">
        <thead className="text-lg text-yellow-200 print:text-black print:bg-gray-100">
          <tr>
            <th className="p-3 font-bold text-left">{timeA}</th>
            <th className="p-3 font-bold">Métrica</th>
            <th className="p-3 font-bold text-right">{timeB}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-yellow-900/70 print:divide-gray-300">
          {statRows.map((row) => (
            <tr key={row.key} className="text-yellow-100/90 hover:bg-[#4a0404]/80 print:text-black">
              <td className="p-3 font-mono text-xl text-left">{(stats[row.key] as any)?.timeA || '—'}</td>
              <td className="p-3 font-semibold text-yellow-400/80 print:text-black">{row.label}</td>
              <td className="p-3 font-mono text-xl text-right">{(stats[row.key] as any)?.timeB || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AdvancedMetricsTable: React.FC<{ metrics?: Record<string, TeamMetrics | undefined>; timeA: string; timeB: string }> = ({
  metrics,
  timeA,
  timeB,
}) => {
  if (!metrics) return null;

  const rows = Object.entries(metrics)
    .filter(([, v]) => v && (v.timeA || v.timeB))
    .map(([k, v]) => ({ k, v: v as TeamMetrics }));

  if (rows.length === 0) return null;

  const labelMap: Record<string, string> = {
    xG: 'xG',
    grandesChances: 'Grandes chances',
    chutesNaArea: 'Chutes na área',
    chutesForaDaArea: 'Chutes fora da área',
    passesTercoFinal: 'Passes no terço final',
    passesProgressivos: 'Passes progressivos',
    cruzamentos: 'Cruzamentos',
    duelosGanhos: 'Duelos ganhos',
    perdasDePosse: 'Perdas de posse',
    recuperacoes: 'Recuperações',
    fieldTilt: 'Field tilt',
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-center bg-[#4a0404]/30 rounded-lg border border-yellow-900/40">
        <thead className="text-sm text-yellow-200/90">
          <tr>
            <th className="p-3 font-bold text-left">{timeA}</th>
            <th className="p-3 font-bold">Indicador</th>
            <th className="p-3 font-bold text-right">{timeB}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-yellow-900/50">
          {rows.map(({ k, v }) => (
            <tr key={k} className="text-yellow-100/90 hover:bg-[#4a0404]/50">
              <td className="p-3 font-mono text-left">{v.timeA || '—'}</td>
              <td className="p-3 font-semibold text-yellow-400/80">{labelMap[k] || k}</td>
              <td className="p-3 font-mono text-right">{v.timeB || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SummaryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
const KeyMomentsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.951.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.05 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);
const TacticIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const StatsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6m6 0v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z"
    />
  </svg>
);
const ContextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M8 7V3M16 7V3M4 11h16M5 5h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const PlayersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="8.5" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 8v6M23 11h-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => {
  const parsePercent = (str: string) => parseFloat(str?.replace('%', '')) || 0;
  const parseIntSimple = (str: string) => parseInt(str, 10) || 0;

  const possessionData = [
    { name: analysis.timeA, value: parsePercent(analysis.estatisticas?.posseDeBola?.timeA || '0%') },
    { name: analysis.timeB, value: parsePercent(analysis.estatisticas?.posseDeBola?.timeB || '0%') },
  ];

  const shotsData = [
    {
      name: 'Finalizações',
      [analysis.timeA]: parseIntSimple(analysis.estatisticas?.finalizacoes?.timeA || '0'),
      [analysis.timeB]: parseIntSimple(analysis.estatisticas?.finalizacoes?.timeB || '0'),
    },
    {
      name: 'No Alvo',
      [analysis.timeA]: parseIntSimple(analysis.estatisticas?.finalizacoesNoAlvo?.timeA || '0'),
      [analysis.timeB]: parseIntSimple(analysis.estatisticas?.finalizacoesNoAlvo?.timeB || '0'),
    },
  ];

  const contexto = analysis.contextoPartida;
  const verificacao = analysis.verificacaoAuditoria;

  return (
    <div className="p-4 md:p-6 space-y-8 print:space-y-4 print:p-0">
      <div className="bg-[#2a0101]/50 backdrop-blur-sm rounded-lg p-6 border border-yellow-900/50 print:bg-white print:border-b print:border-gray-300 text-center">
        <div className="mb-4">
          <span className="text-yellow-500/60 text-xs uppercase tracking-widest font-bold">Vídeo Identificado</span>
          <h2 className="text-yellow-200 text-lg md:text-xl font-semibold italic">"{analysis.videoTitle}"</h2>
          {analysis.videoUrl && (
            <div className="mt-2 text-xs md:text-sm">
              <a
                href={analysis.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-300/90 hover:text-yellow-200 underline break-all print:text-black print:no-underline"
                title="Abrir o vídeo original no YouTube"
              >
                {analysis.videoUrl}
              </a>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="w-1/3 text-xl md:text-3xl font-bold text-yellow-200 print:text-black">{analysis.timeA}</div>
          <div className="w-1/3">
            <p className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 py-2 print:text-black">
              {analysis.placar}
            </p>
            <p className="text-yellow-400/70 text-sm print:text-gray-600">Placar Final</p>
          </div>
          <div className="w-1/3 text-xl md:text-3xl font-bold text-yellow-200 print:text-black">{analysis.timeB}</div>
        </div>
      </div>

      {contexto && (contexto.competicao || contexto.dataJogo || contexto.estadio) && (
        <AnalysisCard title="Contexto da Partida" icon={<ContextIcon />}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div><span className="text-yellow-200 font-semibold">Competição:</span> {contexto.competicao || '—'}</div>
              <div><span className="text-yellow-200 font-semibold">Temporada:</span> {contexto.temporada || '—'}</div>
              <div><span className="text-yellow-200 font-semibold">Fase:</span> {contexto.fase || '—'}</div>
              <div><span className="text-yellow-200 font-semibold">Data do jogo:</span> {contexto.dataJogo || '—'}</div>
            </div>
            <div className="space-y-2">
              <div><span className="text-yellow-200 font-semibold">Estádio:</span> {contexto.estadio || '—'}</div>
              <div><span className="text-yellow-200 font-semibold">Cidade:</span> {contexto.cidade || '—'}</div>
              <div><span className="text-yellow-200 font-semibold">Árbitro:</span> {contexto.arbitro || '—'}</div>
              <div><span className="text-yellow-200 font-semibold">Público/Clima:</span> {(contexto.publico || '—') + (contexto.condicoesClimaticas ? ` | ${contexto.condicoesClimaticas}` : '')}</div>
            </div>
          </div>
          {verificacao?.nivelConfianca && (
            <div className="mt-4 text-sm text-yellow-200/90">
              <span className="font-semibold">Nível de confiança:</span> {verificacao.nivelConfianca}
            </div>
          )}
        </AnalysisCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:space-y-4">
        <AnalysisCard title="Resumo" icon={<SummaryIcon />}>
          <p>{analysis.resumoPartida}</p>
        </AnalysisCard>
        <AnalysisCard title="Momentos-Chave" icon={<KeyMomentsIcon />}>
          <div className="whitespace-pre-wrap">{analysis.momentosChave}</div>
        </AnalysisCard>
      </div>

      {analysis.formacoes && (analysis.formacoes.timeA?.esquema || analysis.formacoes.timeB?.esquema) && (
        <AnalysisCard title="Formações e Funções" icon={<TacticIcon />}>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <SectionTitle>{analysis.timeA}</SectionTitle>
              <div><span className="text-yellow-200 font-semibold">Esquema:</span> {analysis.formacoes.timeA?.esquema || '—'}</div>
              <div>
                <span className="text-yellow-200 font-semibold">Titulares:</span>
                <MiniList items={analysis.formacoes.timeA?.titulares} />
              </div>
              {analysis.formacoes.timeA?.destaquesFuncionais && (
                <TacticalInfo title="Destaques funcionais" text={analysis.formacoes.timeA?.destaquesFuncionais} />
              )}
            </div>
            <div className="space-y-3">
              <SectionTitle>{analysis.timeB}</SectionTitle>
              <div><span className="text-yellow-200 font-semibold">Esquema:</span> {analysis.formacoes.timeB?.esquema || '—'}</div>
              <div>
                <span className="text-yellow-200 font-semibold">Titulares:</span>
                <MiniList items={analysis.formacoes.timeB?.titulares} />
              </div>
              {analysis.formacoes.timeB?.destaquesFuncionais && (
                <TacticalInfo title="Destaques funcionais" text={analysis.formacoes.timeB?.destaquesFuncionais} />
              )}
            </div>
          </div>
        </AnalysisCard>
      )}

      <AnalysisCard title="Fase Defensiva" icon={<TacticIcon />}>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <SectionTitle>{analysis.timeA}</SectionTitle>
            <TacticalInfo title="Posicionamento/Bloco" text={analysis.faseDefensiva?.timeA?.posicionamento} />
            <TacticalInfo title="Compactação e Pressão" text={analysis.faseDefensiva?.timeA?.compactacao_pressao} />
            <TacticalInfo title="Transição Defensiva" text={analysis.faseDefensiva?.timeA?.transicao} />
          </div>
          <div className="space-y-4">
            <SectionTitle>{analysis.timeB}</SectionTitle>
            <TacticalInfo title="Posicionamento/Bloco" text={analysis.faseDefensiva?.timeB?.posicionamento} />
            <TacticalInfo title="Compactação e Pressão" text={analysis.faseDefensiva?.timeB?.compactacao_pressao} />
            <TacticalInfo title="Transição Defensiva" text={analysis.faseDefensiva?.timeB?.transicao} />
          </div>
        </div>
      </AnalysisCard>

      <AnalysisCard title="Fase Ofensiva" icon={<TacticIcon />}>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <SectionTitle>{analysis.timeA}</SectionTitle>
            <TacticalInfo title="Saída de bola" text={analysis.faseOfensiva?.timeA?.saidaDeBola} />
            <TacticalInfo title="Criação/Progressão" text={analysis.faseOfensiva?.timeA?.criacao} />
            <TacticalInfo title="Finalização e movimentação" text={analysis.faseOfensiva?.timeA?.finalizacao_movimentacao} />
          </div>
          <div className="space-y-4">
            <SectionTitle>{analysis.timeB}</SectionTitle>
            <TacticalInfo title="Saída de bola" text={analysis.faseOfensiva?.timeB?.saidaDeBola} />
            <TacticalInfo title="Criação/Progressão" text={analysis.faseOfensiva?.timeB?.criacao} />
            <TacticalInfo title="Finalização e movimentação" text={analysis.faseOfensiva?.timeB?.finalizacao_movimentacao} />
          </div>
        </div>
      </AnalysisCard>

      {analysis.pressao && (analysis.pressao.timeA || analysis.pressao.timeB) && (
        <AnalysisCard title="Pressão, Bloco e Gatilhos" icon={<TacticIcon />}>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <SectionTitle>{analysis.timeA}</SectionTitle>
              <TacticalInfo title="Altura do bloco" text={analysis.pressao.timeA?.alturaBloco} />
              <TacticalInfo title="Gatilhos" text={analysis.pressao.timeA?.gatilhos} />
              <TacticalInfo title="Comportamento sem bola" text={analysis.pressao.timeA?.comportamentoSemBola} />
              <TacticalInfo title="PPDA (se houver)" text={analysis.pressao.timeA?.ppdaEstimado} />
              <TacticalInfo title="Recuperação alta" text={analysis.pressao.timeA?.recuperacaoAlta} />
            </div>
            <div className="space-y-4">
              <SectionTitle>{analysis.timeB}</SectionTitle>
              <TacticalInfo title="Altura do bloco" text={analysis.pressao.timeB?.alturaBloco} />
              <TacticalInfo title="Gatilhos" text={analysis.pressao.timeB?.gatilhos} />
              <TacticalInfo title="Comportamento sem bola" text={analysis.pressao.timeB?.comportamentoSemBola} />
              <TacticalInfo title="PPDA (se houver)" text={analysis.pressao.timeB?.ppdaEstimado} />
              <TacticalInfo title="Recuperação alta" text={analysis.pressao.timeB?.recuperacaoAlta} />
            </div>
          </div>
        </AnalysisCard>
      )}

      {analysis.modeloDeJogo && (analysis.modeloDeJogo.timeA || analysis.modeloDeJogo.timeB) && (
        <AnalysisCard title="Modelo de Jogo" icon={<TacticIcon />}>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <SectionTitle>{analysis.timeA}</SectionTitle>
              <TacticalInfo title="Organização" text={analysis.modeloDeJogo.timeA?.organizacao} />
              <TacticalInfo title="Saída de bola" text={analysis.modeloDeJogo.timeA?.saidaDeBola} />
              <TacticalInfo title="Progressão" text={analysis.modeloDeJogo.timeA?.progressao} />
              <TacticalInfo title="Terço final" text={analysis.modeloDeJogo.timeA?.tercoFinal} />
              <TacticalInfo title="Finalização" text={analysis.modeloDeJogo.timeA?.finalizacao} />
              <TacticalInfo title="Transição ofensiva" text={analysis.modeloDeJogo.timeA?.transicaoOfensiva} />
              <TacticalInfo title="Transição defensiva" text={analysis.modeloDeJogo.timeA?.transicaoDefensiva} />
              <TacticalInfo title="Contra-pressão" text={analysis.modeloDeJogo.timeA?.contraPressao} />
            </div>
            <div className="space-y-4">
              <SectionTitle>{analysis.timeB}</SectionTitle>
              <TacticalInfo title="Organização" text={analysis.modeloDeJogo.timeB?.organizacao} />
              <TacticalInfo title="Saída de bola" text={analysis.modeloDeJogo.timeB?.saidaDeBola} />
              <TacticalInfo title="Progressão" text={analysis.modeloDeJogo.timeB?.progressao} />
              <TacticalInfo title="Terço final" text={analysis.modeloDeJogo.timeB?.tercoFinal} />
              <TacticalInfo title="Finalização" text={analysis.modeloDeJogo.timeB?.finalizacao} />
              <TacticalInfo title="Transição ofensiva" text={analysis.modeloDeJogo.timeB?.transicaoOfensiva} />
              <TacticalInfo title="Transição defensiva" text={analysis.modeloDeJogo.timeB?.transicaoDefensiva} />
              <TacticalInfo title="Contra-pressão" text={analysis.modeloDeJogo.timeB?.contraPressao} />
            </div>
          </div>
        </AnalysisCard>
      )}

      <AnalysisCard title="Estatísticas" icon={<StatsIcon />}>
        <div className="mb-8 print:hidden grid md:grid-cols-2 gap-8">
          <div className="h-64">
            <PossessionChart data={possessionData} />
          </div>
          <div className="h-64">
            <ShotsChart data={shotsData} timeA={analysis.timeA} timeB={analysis.timeB} />
          </div>
        </div>

        <StatisticsTable stats={analysis.estatisticas} timeA={analysis.timeA} timeB={analysis.timeB} />

        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <div className="print:hidden">
            <SectionTitle>Mapa de Calor (terços)</SectionTitle>
            <div className="mt-3">
              {analysis.estatisticas?.mapaDeCalor?.timeA && analysis.estatisticas?.mapaDeCalor?.timeB ? (
              <HeatmapDisplay data={analysis.estatisticas.mapaDeCalor} timeA={analysis.timeA} timeB={analysis.timeB} />
            ) : (
              <p className="text-yellow-100/60 print:text-black">Mapa de calor indisponível.</p>
            )}
            </div>
          </div>
          <div>
            <SectionTitle>Indicadores avançados (se houver)</SectionTitle>
            <div className="mt-3">
              <AdvancedMetricsTable metrics={analysis.indicadoresAvancados as any} timeA={analysis.timeA} timeB={analysis.timeB} />
            </div>
          </div>
        </div>
      </AnalysisCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:space-y-4">
        <AnalysisCard title="Pontos Fortes" icon={<TacticIcon />}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <SectionTitle>{analysis.timeA}</SectionTitle>
              <MiniList items={analysis.pontosFortes?.timeA} />
            </div>
            <div>
              <SectionTitle>{analysis.timeB}</SectionTitle>
              <MiniList items={analysis.pontosFortes?.timeB} />
            </div>
          </div>
        </AnalysisCard>

        <AnalysisCard title="Pontos Fracos" icon={<TacticIcon />}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <SectionTitle>{analysis.timeA}</SectionTitle>
              <MiniList items={analysis.pontosFracos?.timeA} />
            </div>
            <div>
              <SectionTitle>{analysis.timeB}</SectionTitle>
              <MiniList items={analysis.pontosFracos?.timeB} />
            </div>
          </div>
        </AnalysisCard>
      </div>

      {analysis.analiseJogadores && analysis.analiseJogadores.length > 0 && (
        <AnalysisCard title="Análise de Jogadores" icon={<PlayersIcon />}>
          <div className="space-y-4">
            {analysis.analiseJogadores.map((p, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-black/20 border border-yellow-900/30">
                <div className="text-yellow-200 font-bold">{p.nome}</div>
                <div className="text-yellow-100/80 whitespace-pre-wrap mt-1">{p.analise}</div>
              </div>
            ))}
          </div>
        </AnalysisCard>
      )}

      {(analysis.linhaDoTempo && analysis.linhaDoTempo.length > 0) && (
        <AnalysisCard title="Linha do Tempo (eventos)" icon={<KeyMomentsIcon />}>
          <div className="space-y-3">
            {analysis.linhaDoTempo.slice(0, 30).map((e, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-black/20 border border-yellow-900/30">
                <div className="text-yellow-200 font-semibold">
                  {(e.minuto || '—')} • {(e.time || '—')} • {(e.tipo || 'evento')}
                </div>
                <div className="text-yellow-100/80 whitespace-pre-wrap">{e.descricao || ''}</div>
                {e.impactoTatico && <div className="text-yellow-300/70 text-sm mt-1 whitespace-pre-wrap">{e.impactoTatico}</div>}
              </div>
            ))}
            {analysis.linhaDoTempo.length > 30 && (
              <div className="text-yellow-300/60 text-sm">+ {analysis.linhaDoTempo.length - 30} eventos não exibidos para manter a leitura.</div>
            )}
          </div>
        </AnalysisCard>
      )}

      {(analysis.ajustesTreinadores || analysis.recomendacoesTaticas) && (
        <AnalysisCard title="Ajustes e Recomendações" icon={<TacticIcon />}>
          {analysis.ajustesTreinadores && <TacticalInfo title="Ajustes dos treinadores" text={analysis.ajustesTreinadores} />}
          {analysis.recomendacoesTaticas && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <SectionTitle>{analysis.timeA}</SectionTitle>
                <MiniList items={analysis.recomendacoesTaticas.timeA} />
              </div>
              <div>
                <SectionTitle>{analysis.timeB}</SectionTitle>
                <MiniList items={analysis.recomendacoesTaticas.timeB} />
              </div>
            </div>
          )}
        </AnalysisCard>
      )}

      <AnalysisCard title="Conclusão" icon={<SummaryIcon />}>
        <div className="whitespace-pre-wrap">{analysis.conclusaoRecomendacoes}</div>
        {verificacao && (verificacao.partidaIdentificada || verificacao.observacoes) && (
          <div className="mt-4 p-4 rounded-lg bg-black/20 border border-yellow-900/30">
            <div className="text-yellow-200 font-bold mb-2">Auditoria</div>
            {verificacao.partidaIdentificada && (
              <div className="text-yellow-100/80"><span className="text-yellow-200 font-semibold">Partida:</span> {verificacao.partidaIdentificada}</div>
            )}
            {verificacao.observacoes && (
              <div className="text-yellow-100/80 whitespace-pre-wrap mt-2">{verificacao.observacoes}</div>
            )}
            {verificacao.fontesPrincipais && verificacao.fontesPrincipais.length > 0 && (
              <div className="mt-2">
                <div className="text-yellow-200 font-semibold">Fontes principais:</div>
                <MiniList items={verificacao.fontesPrincipais} />
              </div>
            )}
          </div>
        )}
      </AnalysisCard>

      {/* Grounding Sources */}
      {analysis.sources && analysis.sources.length > 0 && (
        <div className="bg-black/20 p-6 rounded-lg border border-yellow-900/30 print:hidden">
          <h4 className="text-yellow-400 font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Fontes da Análise (Grounding)
          </h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {analysis.sources.map((src, i) => (
              <a
                key={i}
                href={src.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-yellow-200/60 hover:text-yellow-300 truncate block p-2 bg-black/40 rounded border border-yellow-900/20"
                title={src.uri}
              >
                {src.title || src.uri}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDisplay;
