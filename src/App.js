import {Alert, AlertIcon, Box, Container, Divider, Flex, Heading, Spacer, Text} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import {TabsPage} from "./Tabs";
import {DeviceState} from "./components/DeviceState";
import {ConnectionContext, DeviceContext} from "./Contexts";

function App() {
  const [connected, setConnected] = useState(false);


  useEffect(() => {
    window.SGuai.disconnectionCallback = () => {
      console.log("device disconnected!");
      setConnected(false);
    }
    window.SGuai.setConnected = setConnected;
    window.SGuai.setCommand = (c) => {
      const a = [];
      for (let i = 0; i < c.command.byteLength; i++) {
        a.push(('00' + c.command[i].toString(16)).slice(-2));
      };
      console.log(c.direction, a.join(" "));
    };
  }, []);

  return (
    <ConnectionContext.Provider value={connected}>
      <DeviceContext.Provider value={window?.SGuai}>
        <div>
          <Container maxW='6xl' my={10}>
            <Flex>
              <Box p='4'>
                <Heading as='h3' size='lg'>
                  SGuai Controls
                </Heading>
                <Text>For SGUAI-C(3|5)R?, Web Bluetooth Based</Text>
              </Box>
              <Spacer />
              <DeviceState />
            </Flex>
            <Box>
              {
                connected ? null : (
                  <Alert status='error' my={2}>
                    <AlertIcon />
                    Device not connected. Changes will NOT take effect.
                  </Alert>
                )
              }
            </Box>
            <TabsPage />
            <Divider my={4} />
          </Container>
        </div>
      </DeviceContext.Provider>
    </ConnectionContext.Provider>
  );
}

export default App;