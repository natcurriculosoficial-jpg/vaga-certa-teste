interface LogoProps {
  size?: "sm" | "md" | "lg";
  /** "full" = ícone + texto (sidebar aberta); "icon" = só o ícone (sidebar fechada) */
  variant?: "full" | "icon";
}

const HEIGHTS = { sm: "h-8", md: "h-9", lg: "h-12" };

// Cada variante tem 2 arquivos: um para tema claro (traços escuros) e um
// para tema escuro (traços brancos). A troca é automática via classe dark:.
const Logo = ({ size = "md", variant = "full" }: LogoProps) => {
  const h = HEIGHTS[size];
  const light = variant === "full" ? "/logo-full-light.png" : "/logo-icon-light.png";
  const dark = variant === "full" ? "/logo-full-dark.png" : "/logo-icon-dark.png";
  return (
    <>
      <img src={light} alt="Vaga Certa" className={`${h} w-auto object-contain block dark:hidden`} />
      <img src={dark} alt="Vaga Certa" className={`${h} w-auto object-contain hidden dark:block`} />
    </>
  );
};

export default Logo;
