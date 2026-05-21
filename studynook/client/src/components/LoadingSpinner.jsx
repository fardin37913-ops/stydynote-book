const LoadingSpinner = ({ text = "Loading..." }) => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
      <p className="text-slate-600 font-medium">{text}</p>
    </div>
  );
};

export default LoadingSpinner;