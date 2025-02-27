import Home from "./home/page";

export default function PageLayout() {
  return (
<div className="flex flex-col md:flex-row min-h-screen">
      <Home/>
      {/* <MultiStepForm/> */}
    </div>
  );
}
