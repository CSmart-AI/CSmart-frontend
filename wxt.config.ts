import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ["@wxt-dev/module-react"],
	manifest: {
		permissions: ["storage", "tabs"],
	},
	vite: () => ({
		// biome-ignore lint/suspicious/noExplicitAny: Vite 버전 충돌로 인한 타입 캐스팅 필요
		plugins: [tsconfigPaths() as any, tailwindcss()],
	}),
});
