import {Box, Tab, TabList, Tabs} from "@chakra-ui/react";
import {Route, Routes, useLocation, useNavigate} from "react-router-dom";
import {PixelScreen} from "./tabs/PixelScreen";
import {TextMode} from "./tabs/TextMode";
import {Effects} from "./tabs/Effects";
import {PixelAnimations} from "./tabs/PixelAnimations";


export function TabsPage(props) {

  let navigate = useNavigate();
  let { pathname } = useLocation();

  const pages = [
    {
      path: "/pixel",
      name: "Pixel Screen",
      element: <PixelScreen {...props} />
    },
    {
      path: "/animation",
      name: "Animation",
      element: <PixelAnimations {...props} />
    },
    {
      path: "/text",
      name: "Text",
      element: <TextMode {...props} />
    },
    {
      path: "/effects",
      name: "Effects",
      element: <Effects {...props} />
    }
  ].map((val, i) => ({...val, index: i}))


  let tabIndex = 0;

  for(const route of pages) {
    if (route.path === pathname) {
      tabIndex = route.index;
    }
  }
  return (
    <Box>
      <Tabs defaultIndex={tabIndex}>
        <TabList>
          {
            pages.map(p =>
              <Tab onClick={() => navigate(p.path)} key={p.path}>{p.name}</Tab>
            )
          }
        </TabList>
      </Tabs>
      <Box mt={1} p={2}>
        <Routes>
          {
            pages.map(p => <Route {...p} key={p.path} />)
          }
        </Routes>
      </Box>
    </Box>
  );
}