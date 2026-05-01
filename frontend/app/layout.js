import "./globals.css";
import MainWrapper from "@/components/MainWrapper";

export const metadata = {
  title: "XAI-MedRisk - AI Health Analysis",
  description: "Advanced explainable AI for clinical health risk prediction",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <MainWrapper>
          {children}
        </MainWrapper>
      </body>
    </html>
  );
}
