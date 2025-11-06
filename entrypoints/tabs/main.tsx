import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import "./index.css";

/**
 * 메인 앱 진입점
 * 로그인 후 새 탭에서 실행되는 메인 애플리케이션
 */

// biome-ignore lint/style/noNonNullAssertion: basic method from wxt
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
