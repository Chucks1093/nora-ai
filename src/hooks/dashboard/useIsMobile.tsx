import { useState, useEffect } from "react";

const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkIsMobile = () => {
			setIsMobile(window.innerWidth < 768); // 768px is md breakpoint in Tailwind
		};

		checkIsMobile();
		window.addEventListener("resize", checkIsMobile);

		return () => window.removeEventListener("resize", checkIsMobile);
	}, []);

	return isMobile;
};

export default useIsMobile;
