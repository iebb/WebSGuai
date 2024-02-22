import {Alert, AlertIcon, Box, Button, Container, Flex, Heading, Spacer, Text} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import {TabsPage} from "./Tabs";
import {DeviceState} from "./components/DeviceState";
import {DeviceContext, ConnectionContext} from "./Contexts";

function App() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    window.SGuai.disconnectionCallback = () => {
      console.log("device disconnected!");
      setConnected(false);
    }
    window.SGuai.setConnected = setConnected;
  }, []);

  return (
    <ConnectionContext.Provider value={connected}>
      <DeviceContext.Provider value={window?.SGuai}>
        <div>
          <Container maxW='4xl' my={10}>
            <Flex>
              <Box p='4'>
                <Heading as='h3' size='lg'>
                  SGuai Controls
                </Heading>
              </Box>
              <Spacer />
              <DeviceState />
            </Flex>
            <Box>
              {
                connected ? null : (
                  <Alert status='error' my={4}>
                    <AlertIcon />
                    Device not connected. Changes will NOT take effect.
                  </Alert>
                )
              }
            </Box>
            <TabsPage />
          </Container>
        </div>
      </DeviceContext.Provider>
    </ConnectionContext.Provider>
  );
}

export default App;