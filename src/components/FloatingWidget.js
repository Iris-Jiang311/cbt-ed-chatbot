import React, { useState } from 'react';
import '../styles/FloatingWidget.css'; // ✅ 需要创建 FloatingWidget.css

function FloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="floating-widget">
      {/* 🔹 悬浮按钮 */}
      <button className="widget-button" onClick={toggleWidget}>
        {isOpen ? "✖" : "💡"}
      </button>

      {/* 🔹 展开的面板 */}
      {isOpen && (
        <div className="widget-content">
          <h3>🎓 Mitigation Plan</h3>
          <p>If you're feeling emotionally overwhelmed, consider reaching out to your university’s student health services:</p>
          <ul>
            <li><a href="https://liu.se/en/education/student-health-care" target="_blank" rel="noopener noreferrer">Linköping University Student Health Care Center ↗️</a></li>
            <li><a href="https://www.gu.se/en/study-in-gothenburg/campus-and-student-life/student-services-and-support#student-health-care" target="_blank" rel="noopener noreferrer">University of Gothenburg Student Services and Support ↗️</a></li>
            <li><a href="https://www.lunduniversity.lu.se/current-students/healthcare/student-health-centre" target="_blank" rel="noopener noreferrer">Lund University Student Health Counseling ↗️</a></li>
            <li><a href="https://student.mau.se/en/student-services/student-health-service/" target="_blank" rel="noopener noreferrer">Malmö University Student Health Service ↗️</a></li>
            <li><a href="https://ju.se/student/en/service/student-health-care.html" target="_blank" rel="noopener noreferrer">Jönköping University Student Health Care Service ↗️</a></li>
            <li><a href="https://www.kth.se/en/student/stod/halsa/studenthalsan-1.409886" target="_blank" rel="noopener noreferrer">KTH Student Health Services ↗️</a></li>
            <li><a href="https://www.su.se/english/education/student-health/stockholm-student-health-services/stockholm-student-health-services-1.448456" target="_blank" rel="noopener noreferrer">Stockholm University Health Service ↗️</a></li>
            <li><a href="https://www.hb.se/en/student/support/student-health-care-centre/social-counsellor/" target="_blank" rel="noopener noreferrer">Borås University Social Counselor ↗️</a></li>
            <li><a href="https://www.uu.se/en/students/support-and-services/student-health-service/student-health-service-in-uppsala" target="_blank" rel="noopener noreferrer">Uppsala University Student Health Counseling ↗️</a></li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default FloatingWidget;
