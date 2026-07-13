interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const MARK_SIZES = { sm: "h-6", md: "h-8", lg: "h-11" };
const TEXT_SIZES = { sm: "text-base", md: "text-xl", lg: "text-3xl" };

// Ícone VC adapta ao tema (V escuro no fundo claro, V branco no fundo escuro).
// O texto usa text-foreground, que já inverte conforme o tema.
const Logo = ({ size = "md", showText = true }: LogoProps) => {
  return (
    <div className="flex items-center gap-2">
      <img
        src="/logo-mark-light.png"
        alt="Vaga Certa"
        className={`${MARK_SIZES[size]} w-auto block dark:hidden`}
      />
      <img
        src="/logo-mark-dark.png"
        alt="Vaga Certa"
        className={`${MARK_SIZES[size]} w-auto hidden dark:block`}
      />
      {showText && (
        <span className={`${TEXT_SIZES[size]} font-bold text-foreground tracking-tight`}>
          Vaga Certa
        </span>
      )}
    </div>
  );
};

export default Logo;
