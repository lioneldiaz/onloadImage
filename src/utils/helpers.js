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

      if (width > height && width > max_size) {
        height *= max_size / width
        width = max_size     
      } else if (height > max_size) {
        width *= max_size / height
        height = max_size
      }

      canvas.width = width
      canvas.height = height
      context.clearRect(0, 0, canvas.width, canvas.height)

      context.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height)
      
      resolve(canvas.toDataURL('image/jpeg'))
    }
    image.src = imageURL
  })