"use client"
import { extendTheme } from "@chakra-ui/react"

const theme = extendTheme({
    styles: {
      global: {
        body: {
          bg: "#000", 
          color: "white",
        },
      },
    },
  });


export default theme