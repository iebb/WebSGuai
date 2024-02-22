import {useContext, useState} from "react";
import {Heading, Input} from "@chakra-ui/react";
import {ConnectionContext} from "../Contexts";


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


  const handleChange = async (event) => {
    setValue(event.target.value)
    localStorage.text = event.target.value;
    const encoded = strEncodeUTF16(event.target.value);
    if (connected) {
      await SGuai?.send(0x17, [1, ...encoded]);
    }
  }

  return (
    <>
      <Heading as='h4' size='md' my={4}>Text</Heading>
      <Input
        value={value}
        onChange={handleChange}
        placeholder=''
        size='lg'
      />
    </>
  )
}
