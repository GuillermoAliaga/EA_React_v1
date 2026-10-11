export type ViewMode = 'list' | 'cards';

export function savedViewMode(key: string): ViewMode {
  return localStorage.getItem(key) === 'cards' ? 'cards' : 'list';
}

interface Props {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ mode, onModeChange }: Props) {
  return (
    <div className="view-toggle-bo">
      <button className={mode === 'list' ? 'active' : ''} onClick={() => onModeChange('list')}>
        Lista
      </button>
      <button className={mode === 'cards' ? 'active' : ''} onClick={() => onModeChange('cards')}>
        Cards
      </button>
    </div>
  );
}