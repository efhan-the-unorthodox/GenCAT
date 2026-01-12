import { useState } from 'react';

interface Segment {
  id: string;
  text: string;
  alternatives: string[];
}

interface SegmentSelectorProps {
  translation: string;
  onUpdateTranslation: (translation: string) => void;
}

export function SegmentSelector({ translation, onUpdateTranslation }: SegmentSelectorProps) {
  // Mock segments with alternatives - in a real app this would come from AI
  const [segments, setSegments] = useState<Segment[]>([
    {
      id: '1',
      text: '系统性评估',
      alternatives: ['系统性评审', '系统化评估', '系统性审查'],
    },
    {
      id: '2',
      text: '表明',
      alternatives: ['指出', '显示', '证明'],
    },
    {
      id: '3',
      text: '数周',
      alternatives: ['几周', '若干周', '多周'],
    },
    {
      id: '4',
      text: '正念冥想',
      alternatives: ['冥想练习', '正念练习', '静心冥想'],
    },
    {
      id: '5',
      text: '干预',
      alternatives: ['介入', '治疗', '措施'],
    },
    {
      id: '6',
      text: '可以',
      alternatives: ['能够', '能', '可'],
    },
    {
      id: '7',
      text: '显著',
      alternatives: ['明显', '大幅', '重要地'],
    },
    {
      id: '8',
      text: '改善',
      alternatives: ['提升', '提高', '增强'],
    },
    {
      id: '9',
      text: '睡眠质量',
      alternatives: ['睡眠品质', '睡眠状况', '睡眠水平'],
    },
  ]);

  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);

  const handleSegmentClick = (segmentId: string) => {
    setActiveSegmentId(activeSegmentId === segmentId ? null : segmentId);
  };

  const handleAlternativeSelect = (segmentId: string, alternative: string) => {
    const updatedSegments = segments.map(seg =>
      seg.id === segmentId ? { ...seg, text: alternative } : seg
    );
    setSegments(updatedSegments);
    
    // Rebuild translation from segments
    const newTranslation = updatedSegments.map(seg => seg.text).join('');
    onUpdateTranslation(newTranslation + '。');
    setActiveSegmentId(null);
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-500">
        Click on segments to see alternative phrasings:
      </div>
      
      <div className="flex flex-wrap gap-2">
        {segments.map((segment, index) => (
          <div key={segment.id} className="relative">
            <button
              onClick={() => handleSegmentClick(segment.id)}
              className={`px-3 py-2 rounded-lg border-2 transition-all ${
                activeSegmentId === segment.id
                  ? 'border-[#29bafe] bg-blue-50 text-blue-900'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              <span className="text-xs text-gray-500 mr-1">{index + 1}.</span>
              {segment.text}
            </button>

            {activeSegmentId === segment.id && (
              <div className="absolute top-full mt-2 left-0 z-20 bg-white border border-gray-300 rounded-lg shadow-lg p-2 min-w-[200px]">
                <div className="text-xs text-gray-500 mb-2 px-2">Select alternative:</div>
                <div className="space-y-1">
                  {segment.alternatives.map((alt, altIndex) => (
                    <button
                      key={altIndex}
                      onClick={() => handleAlternativeSelect(segment.id, alt)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-yellow-100 transition-colors text-sm"
                    >
                      {alt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        <span className="text-gray-600 self-center">。</span>
      </div>
    </div>
  );
}