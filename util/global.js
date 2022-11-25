const AUDIOREG = /^!\[\[(Recording\s\d{14}\.webm)\]\]$/igm;
const IMAGEREG = /^!\[\[(.*\.(gif|jpe?g|tiff?|png|webp|bmp))\]\]$/igm;


module.exports = {
  AUDIOREG,
  IMAGEREG,
}