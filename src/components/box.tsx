interface BoxProps {
  children: React.ReactNode;
}

export default function Box({ children }: BoxProps) {
  return (
    <div
      className="bg-gradient-to-r from-[--begin-gradient]
              to-[--end-gradient] p-4 border border-[--border-color]
              rounded-md w-[--boxes-width]"
    >
      {children}
    </div>
  );
}
