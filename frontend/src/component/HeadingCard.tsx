import React from "react";

const HeadingCard: React.FC = () => {
  const progress = 62;

  return (
    <div className="card shadow-sm border-0 p-4">
      <div className="row align-items-center">

        <div className="col-md-9">
          <h2 className="fw-bold mb-2">68 Days Left</h2>

          <p className="mb-1 text-muted">
            <span className="me-2">📊</span>
            <strong>Current Stage:</strong> Carpentry Work
          </p>

          <p className="mb-3 text-muted">
            <span className="me-2">➡️</span>
            <strong>Next Stage:</strong> Finishing
          </p>

          <div className="mb-2 d-flex justify-content-between">
            <span className="text-muted">Project Progress</span>
            <strong>{progress}% Completed</strong>
          </div>

          <div className="progress" style={{ height: "6px" }}>
            <div
              className="progress-bar bg-dark"
              role="progressbar"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-3 text-muted">
            Expected Completion: <strong>25 Dec 2025</strong>
          </p>
        </div>

        <div className="col-md-3 text-center">
          <div className="position-relative d-inline-block">
            <svg width="120" height="120">
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke="#e9ecef"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke="#1f4f46"
                strokeWidth="8"
                fill="none"
                strokeDasharray="326"
                strokeDashoffset={326 - (326 * progress) / 100}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>

            <div
              className="position-absolute top-50 start-50 translate-middle text-center"
            >
              <h4 className="fw-bold mb-0">{progress}%</h4>
              <small className="text-muted">Complete</small>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeadingCard;
