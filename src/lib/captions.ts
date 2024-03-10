// obviously change this

// add writers to override the original style
export const writersToLookUpTo = ['R. L. Stine', 'Borges'];

export const imageStyle = 'PHOTORREALISTIC'; // try "cartoon style, Salvador Dalí style or whatever you want"

// aspect ratio: 9:16 is vertical
export const height = 1920;
export const width = 1080;

// caption styles
export const fontFamily = 'Montserrat'; // important to change channel style
export const textTransform = 'uppercase'; // change if you don't want all caps... you crazy person
export const fontWeight = '800'; // that's super bold. regular is 400
export const fontSize = process.env.NODE_ENV === 'development' ? '8vh' : '6vh';
export const fontColor = `rgba(243,206,50,1)`; // main color of the word being spoken
export const yPadding = '10 vmin'; // use this to center

export const captionStylesModern = {
  // Make the subtitle container as large as the screen with some padding
  width: '100%',
  height: '100%',
  paddingLeft: '3vmin',
  paddingRight: '3vmin',
  paddingTop: '10vmin',
  paddingBottom: '10vmin',

  // Align text to bottom center
  left: 0,
  bottom: 0,
  // transform: "translate(-50%, -50%)",

  // Text style - note that the default fill color is null (transparent)
  fontFamily,
  textTransform,
  fontWeight,
  fontSize,
  fontColor,
  fillColor: null,
  shadowColor: 'rgba(0,0,0,0.65)',
  shadowBlur: '1.6vmin',
  textShadow: '0px 0px 10px rgba(0,0,0,0.65)',
};
