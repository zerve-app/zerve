import * as React from "react";
import { View } from "react-native";
import Svg, { Defs, LinearGradient, Stop, G, Path } from "react-native-svg";

export function ZerveLogo() {
  return (
    <View
      style={{
        padding: 24,
        transform: [
          {
            scale: 0.6,
          },
          {
            translateX: -115,
          },
        ],
      }}
    >
      <Svg width={346} height={92} xmlns="http://www.w3.org/2000/svg">
        <Defs>
          <LinearGradient
            x1="5.314%"
            y1="53.351%"
            x2="145.631%"
            y2="35.253%"
            id="a"
          >
            <Stop stopColor="#AC44BB" offset="0%" />
            <Stop stopColor="#0B3FC2" offset="100%" />
          </LinearGradient>
          <LinearGradient
            x1="5.314%"
            y1="64.741%"
            x2="145.631%"
            y2="-14.869%"
            id="b"
          >
            <Stop stopColor="#AC44BB" offset="0%" />
            <Stop stopColor="#0B3FC2" offset="100%" />
          </LinearGradient>
          <LinearGradient
            x1="5.314%"
            y1="53.636%"
            x2="145.631%"
            y2="33.997%"
            id="c"
          >
            <Stop stopColor="#AC44BB" offset="0%" />
            <Stop stopColor="#0B3FC2" offset="100%" />
          </LinearGradient>
          <LinearGradient
            x1="176.166%"
            y1="0%"
            x2="92.953%"
            y2="151.259%"
            id="d"
          >
            <Stop stopColor="#340FCF" offset="0%" />
            <Stop stopColor="#AD44BB" offset="100%" />
          </LinearGradient>
          <LinearGradient x1="151.25%" y1="0%" x2="84.47%" y2="151.259%" id="e">
            <Stop stopColor="#340FCF" offset="0%" />
            <Stop stopColor="#AD44BB" offset="100%" />
          </LinearGradient>
          <LinearGradient
            x1="210.863%"
            y1="0%"
            x2="104.765%"
            y2="151.259%"
            id="f"
          >
            <Stop stopColor="#340FCF" offset="0%" />
            <Stop stopColor="#AD44BB" offset="100%" />
          </LinearGradient>
          <LinearGradient
            x1="241.912%"
            y1="0%"
            x2="115.336%"
            y2="151.259%"
            id="g"
          >
            <Stop stopColor="#340FCF" offset="0%" />
            <Stop stopColor="#AD44BB" offset="100%" />
          </LinearGradient>
        </Defs>
        <G fill="none" fillRule="evenodd">
          <Path
            d="M88.842 0 73.906 23H0v-.032L14.915 0h73.927Z"
            fill="url(#a)"
            transform="translate(.081 .5)"
          />
          <Path
            d="M67.56 33 52.623 56H25.2l14.936-23H67.56Z"
            fill="url(#b)"
            transform="translate(.081 .5)"
          />
          <Path
            d="M88.894 66 73.957 89H3.609l14.936-23h70.349Z"
            fill="url(#c)"
            transform="translate(.081 .5)"
          />
          <Path
            fill="url(#d)"
            fillRule="nonzero"
            d="M133.514 66v-6.968l17.822-26.934h-16.08V22.45h30.284v6.968l-17.822 26.934h17.956V66z"
            transform="translate(.081 .5)"
          />
          <Path
            fill="url(#e)"
            fillRule="nonzero"
            d="M177.238 66V22.45h28.14v9.648h-16.616v6.834h14.204v9.648h-14.204v7.772h17.286V66z"
            transform="translate(.081 .5)"
          />
          <Path
            d="M219.22 66V22.45H235.7c3.127 0 6.008.413 8.643 1.24 2.635.826 4.757 2.266 6.365 4.321 1.608 2.055 2.412 4.891 2.412 8.509 0 3.127-.648 5.717-1.943 7.772a13.875 13.875 0 0 1-5.092 4.824L255.533 66H242.67l-7.504-14.606h-4.422V66H219.22Zm11.523-23.718h4.154c4.645 0 6.968-1.92 6.968-5.762 0-1.876-.592-3.171-1.775-3.886-1.184-.715-2.915-1.072-5.193-1.072h-4.154v10.72Z"
            fill="url(#f)"
            fillRule="nonzero"
            transform="translate(.081 .5)"
          />
          <Path
            d="m272.188 66-12.864-43.55h12.194l4.556 19.028a121.785 121.785 0 0 1 1.642 6.867c.469 2.256.994 4.568 1.574 6.935h.268a133.903 133.903 0 0 0 1.642-6.934 176.28 176.28 0 0 1 1.574-6.868l4.422-19.028h11.792L286.124 66h-13.936Z"
            fill="url(#g)"
            fillRule="nonzero"
            transform="translate(.081 .5)"
          />
          <Path
            fill="url(#e)"
            fillRule="nonzero"
            d="M307.872 66V22.45h28.14v9.648h-16.616v6.834H333.6v9.648h-14.204v7.772h17.286V66z"
            transform="translate(.081 .5)"
          />
        </G>
      </Svg>
    </View>
  );
}
