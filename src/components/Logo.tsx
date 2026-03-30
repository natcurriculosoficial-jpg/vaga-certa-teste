const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: { badge: "text-sm px-1.5 py-0.5", text: "text-base" },
    md: { badge: "text-lg px-2 py-1", text: "text-xl" },
    lg: { badge: "text-2xl px-3 py-1.5", text: "text-3xl" },
  };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2">
      <span className={`${s.badge} font-extrabold rounded-lg bg-primary text-primary-foreground`}>
        VC
      </span>
      <span className={`${s.text} font-bold text-foreground tracking-tight`}>
        VAGA CERTA
      </span>
    </div>
  );
};

export default Logo;
