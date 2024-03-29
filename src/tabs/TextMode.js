import {useContext, useEffect, useState} from "react";
import {Box, Button, Heading, Input} from "@chakra-ui/react";
import {ConnectionContext} from "../Contexts";
import {FaPlay} from "react-icons/fa";


function strEncodeUTF16(str) {
  const ret = [];
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    const ch = str.charCodeAt(i);
    ret.push((ch >> 8) & 0xff);
    ret.push((ch) & 0xff);
  }
  return ret;
}

export function TextMode() {
  const [value, setValue] = useState(localStorage.text);
  const connected = useContext(ConnectionContext);
  const { SGuai } = window;

  const play = async () => {
    const encoded = strEncodeUTF16(localStorage.text);
    if (connected) {
      SGuai?.send(0x17, [1, ...encoded]);
    }
  }

  const handleChange = async (event) => {
    setValue(event.target.value)
    localStorage.text = event.target.value;
    const encoded = strEncodeUTF16(event.target.value);
    if (connected) {
      await SGuai?.send(0x17, [1, ...encoded]);
    }
  }

  return (
    <Box>
      <Box>
        <Button leftIcon={<FaPlay />}
                colorScheme='pink'
                variant='solid'
                onClick={() => play()}
                isDisabled={!connected}
        >
          Play On Device
        </Button>
      </Box>
      <Heading as='h4' size='md' my={4}>Text</Heading>
      <Input
        value={value}
        onChange={handleChange}
        placeholder=''
        size='lg'
      />
    </Box>
  )
}
