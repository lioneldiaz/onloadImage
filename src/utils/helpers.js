/**
 * @description Read file
 */
export const readFileAsDataURL = (file) =>
  new Promise(resolve => {
    const reader = new FileReader()

    reader.onload = (event) => {
      resolve(event.target.result)
    }
    reader.readAsDataURL(file)
  })
/**
 * @description Resize a image
 * @param {string} imageURL 
 * @param {HTMLElement} canvas 
 * @param {number} max_size 
 */
export const resizeImage = (imageURL, canvas, max_size) =>
  new Promise(resolve => {
    const image = new Image()

    image.onload = () => {
      const context = canvas.getContext('2d')

      let width = image.width
      let height = image.height

      height *= max_size / width
      width = max_size
      
      canvas.width = width
      canvas.height = height
      context.clearRect(0, 0, canvas.width, canvas.height)

      context.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height)
      
      resolve(canvas.toDataURL('image/jpeg'))
    }
    image.src = imageURL
  })

/**
 * @description Resize image to the measure of the input
 * @param {HTMLElement} canvaImage
 * @param {Object} measure
 */
export const resizeToInput = (canvaImage, {...measure}, sizeInput) =>
  new Promise(resolve => {
    const { divWidth, divHeight } = measure
    this.canvas = document.createElement('canvas')
    this.canvas.setAttribute('id','newImage')
    this.canvas.style.borderRadius = '3px'
    this.canvas.width = sizeInput
    this.canvas.height = sizeInput
    const context = this.canvas.getContext('2d')
    context.drawImage(canvaImage, 0, 0, divWidth, divHeight, 0, 0, sizeInput, sizeInput)     
    resolve (this.canvas.toDataURL('image/jpeg'))
  }) 