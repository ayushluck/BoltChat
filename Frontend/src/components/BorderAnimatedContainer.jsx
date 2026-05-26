// How to make animated gradient border
// https://cruip-tutorials.vercel.app/animated-gradient-border/
function BorderAnimatedContainer({ children }) {
  return (
    <div className="animated-border-container w-full h-full rounded-2xl border border-transparent flex overflow-hidden">
      {children}
    </div>
  );
}

export default BorderAnimatedContainer;
