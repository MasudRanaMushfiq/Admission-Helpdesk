export default function Loader({ text = 'Loading...', fullPage = false }) {
  return (
    <div className={fullPage ? 'loader loader-full' : 'loader'}>
      <span className="spinner" />
      <span>{text}</span>
    </div>
  );
}
