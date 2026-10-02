// Icônes au trait utilisées par les boutons d'action. Elles sont décoratives :
// le bouton qui les porte fournit le libellé (aria-label et title).

const PATHS = {
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 12a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 19l1-12M9 7V4.5h6V7",
  pencil: "M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17l-1 3ZM14.5 7.5l3 3",
  close: "M6 6l12 12M18 6 6 18",
  star: "m12 3.5 2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9L12 3.5Z",
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM20 20l-4.9-4.9",
  logout: "M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14M10 16l-4-4 4-4M6 12h9",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "h-4.5 w-4.5" }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

const TONES = {
  neutral: "text-stone-500 hover:bg-stone-100 hover:text-stone-900",
  accent: "text-accent-700 hover:bg-accent-50 hover:text-accent-900",
  danger: "text-stone-500 hover:bg-red-50 hover:text-red-600",
} as const;

type IconButtonProps = {
  icon: IconName;
  /** Libellé lu par les lecteurs d'écran et affiché en infobulle. */
  label: string;
  tone?: keyof typeof TONES;
  onClick: () => void;
  disabled?: boolean;
};

// Bouton réduit à une icône : la zone cliquable fait 36 px pour rester utilisable au doigt.
export function IconButton({ icon, label, tone = "neutral", onClick, disabled }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition disabled:opacity-50 ${TONES[tone]}`}
    >
      <Icon name={icon} />
    </button>
  );
}
