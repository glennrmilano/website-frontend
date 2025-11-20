'use client';

import { Artifact } from '@/lib/types';

interface ArtifactViewerProps {
  artifact: Artifact;
}

export function ArtifactViewer({ artifact }: ArtifactViewerProps) {
  const renderContent = () => {
    switch (artifact.kind) {
      case 'html':
        return (
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: artifact.content }}
          />
        );

      case 'markdown':
        return (
          <div className="prose prose-invert max-w-none whitespace-pre-wrap">
            {artifact.content}
          </div>
        );

      case 'code':
        return (
          <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm text-slate-100">{artifact.content}</code>
          </pre>
        );

      case 'chart_json':
      case 'table':
        return (
          <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm text-slate-100">
              {JSON.stringify(JSON.parse(artifact.content), null, 2)}
            </code>
          </pre>
        );

      default:
        return (
          <div className="text-slate-400">
            Unsupported artifact type: {artifact.kind}
          </div>
        );
    }
  };

  return (
    <div className="border border-slate-600 rounded-lg overflow-hidden bg-slate-800">
      <div className="px-4 py-2 bg-slate-700 border-b border-slate-600">
        <h3 className="text-sm font-semibold text-slate-100">
          {artifact.title}
        </h3>
        <span className="text-xs text-slate-400">{artifact.kind}</span>
      </div>
      <div className="p-4">{renderContent()}</div>
    </div>
  );
}
