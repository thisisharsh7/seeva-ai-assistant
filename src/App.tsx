import { ChatWindow } from "./components/chat";
import { ToastContainer } from "./components/ui";
import { useStreamListener } from "./hooks/useStreamListener";

function App() {
  // Set up stream event listener
  useStreamListener();

  return (
    <>
      <ChatWindow />
      <ToastContainer />
    </>
  );
}

export default App;
