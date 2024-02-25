import {useContext, useEffect, useState} from "react";
import {Box, Button, Center, Heading, Input, Textarea} from "@chakra-ui/react";
import {decodeBitmap, encodeBitmap} from "./images";
import {FaPlay} from "react-icons/fa";
import {ConnectionContext} from "../Contexts";

const defaultImage = "AAAAAAAAAAAAAAAAAAAAAAAVAAAAAAAVAAAAAAAXACJknJORADKVIqRRACrmIsRAACaFIqRAACJ0nJOAAAAAAAAAAAAAAAAA";

const pixelSize = 15;
const marginSize = 1;
const pixelSizeWithMargin = pixelSize + 2 * marginSize;

export function PixelScreen() {
  const [mouseDown, setMouseDown] = useState(false);
  const [image, setImage] = useState(defaultImage);
  const [invalidInput, setInvalidInput] = useState(false);
  const [encoded, setEncoded] = useState("");
  const [textEdit, setTextEdit] = useState("");
  const connected = useContext(ConnectionContext);

  const { SGuai } = window;

  useEffect(() => {
    let image = decodeBitmap(defaultImage);
    try {
      let localImage = decodeBitmap(localStorage.image);
      if (localImage) image = localImage;
    } catch {

    }
    setImage(image);
    updateTextEdit(image);
    setEncoded(encodeBitmap(image));
  }, [SGuai]);

  const play = async (image, preventTextEdit = false) => {
    setImage([...image]);
    SGuai.send(0x25, image);
    setEncoded(encodeBitmap(image));
    if (!preventTextEdit) {
      updateTextEdit(image);
    }
    localStorage.image = encodeBitmap(image);
  }

  const updateTextEdit = (image) => {
    let str = "";
    for(let i = 0; i < 12; i++) {
      for(let j = 0; j < 48; j++) {
        const pos = i * 6 + (j >> 3);
        const innerPos = 1 << (7 - (j & 7));
        str += (image[pos] & innerPos) ? "@" : " ";
      }
      if (i < 11) str += "\n";
    }
    setTextEdit(str);
  }


  return (
    <Box>
      <Box>
        <Button leftIcon={<FaPlay />}
                colorScheme='pink'
                variant='solid'
                onClick={() => play(image)}
                isDisabled={!connected}
        >
          Play On Device
        </Button>
      </Box>
      <Heading as='h4' size='md' my={4}>Base64 Representation</Heading>
      <Input
        isInvalid={invalidInput}
        errorBorderColor='red.300'
        fontFamily="monospace"
        value={encoded}
        onChange={(e) => {
          setEncoded(e.target.value);
          try {
            const arr = decodeBitmap(e.target.value);
            if (arr) {
              play(arr);
              setInvalidInput(false);
            } else {
              setInvalidInput(true);
            }
          } catch (e) {
            setInvalidInput(true);
          }
        }}
        size='xs'
      />
      <Heading as='h4' size='md' my={4}>Pixel Screen Editor (48x12)</Heading>
      <Center>
        <Box
          style={{ overflowX: "auto" }}
          py={4}
        >
          <div
            style={{ minWidth: 48 * pixelSizeWithMargin }}
            onMouseDown={() => setMouseDown(true)}
            onMouseUp={() => setMouseDown(false)}
          >
            {
              Array.from(Array(12)).map((x, i) => (
                <div key={i} style={{ height: pixelSizeWithMargin  }}>
                  {
                    Array.from(Array(48)).map((x, j) => {
                      const pos = i * 6 + (j >> 3);
                      const innerPos = 1 << (7 - (j & 7));
                      const flipBit = () => {
                        image[pos] ^= innerPos;
                        play(image);
                      }
                      return (
                        <div
                          key={j}
                          onClick={flipBit}
                          onMouseEnter={() => {
                            if (mouseDown) flipBit();
                          }}
                          style={{
                            height: pixelSize,
                            width: pixelSize,
                            margin: marginSize,
                            display: "inline-block",
                            borderRadius: "8px 4px",
                            border: image[pos] & innerPos ? "transparent" : "1px solid #7773",
                            background: image[pos] & innerPos ? "#e8abff" : "transparent",
                          }} />
                      )
                    })
                  }
                </div>
              ))
            }
          </div>
        </Box>
      </Center>
      <Heading as='h4' size='md' my={4}>Text Editor (48x12)</Heading>
      <Center>
        <Textarea
          multiple
          fontFamily="monospace"
          value={textEdit}
          height={240}
          noOfLines={12}
          size='xs'
          onChange={(e) => {
            setTextEdit(e.target.value);
            let splits = e.target.value.split("\n");
            for(let i = 0; i < 12; i++) {
              for(let j = 0; j < 48; j++) {
                const pos = i * 6 + (j >> 3);
                const innerPos = 1 << (7 - (j & 7));
                if (splits?.[i]?.[j] && splits?.[i]?.[j] !== " ") {
                  image[pos] |= innerPos;
                } else {
                  image[pos] &= (255 ^ innerPos);
                }
              }
            }
            play(image, true);
          }}
        />
      </Center>
    </Box>
  );
}
