import './LoginPage.css';
function LoginPage() {
  return (
    <div className="bg-container">
      <svg className="wave-svg" viewBox="0 0 200 600" preserveAspectRatio="none">
        <path
          d="M0,0 Q40,300 0,600 L40,600 Q50,300 40,0 Z"
          fill="#2f7b9b"
        />
      </svg>
      <svg className="wave-svg1" viewBox="0 0 200 600" preserveAspectRatio="none">
        <path
          d="M0,0 Q40,300 0,600 L40,600 Q50,300 40,0 Z"
          fill="#5B98B2"
        />
      </svg>
      <div className="right-bg">
        <div className="diamond-glow"></div>
      </div>
    </div>
  );
}
export default LoginPage;