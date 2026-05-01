import "./globals.css";
import MainWrapper from "../components/MainWrapper";
import AuthProvider from "../components/AuthProvider";

export const metadata = {
  title: "XAI-MedRisk - AI Health Analysis",
  description: "Advanced explainable AI for clinical health risk prediction",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <AuthProvider>
          <MainWrapper>
            {children}
          </MainWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
