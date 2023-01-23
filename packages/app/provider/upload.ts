export async function uploadFormFile<T>(
  path: string,
  file: File,
  token?: T,
  onProgress?: (percent: number) => void
) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('token', JSON.stringify(token || null))

  return await new Promise((resolve, reject) => {
    // using the old XHR here instead of fetch, so we have a progress callback
    // without invoking something heavier like axios
    const xhr = new XMLHttpRequest()

    xhr.addEventListener('readystatechange', (e) => {
      // @ts-ignore - readyState type is broken here
      if (e.target?.readyState === 4) {
        resolve(xhr.response)
      }
    })
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        if (event.loaded === event.total) {
          onProgress?.(99)
        } else {
          const percent = Math.round((event.loaded * 100) / event.total)
          onProgress?.(percent)
        }
      }
    })
    xhr.onerror = (e) => {
      reject(e)
    }
    xhr.open('POST', path, true)
    xhr.send(formData)
  })
}

export async function uploadFile<T>(
  path: string,
  file: File,
  onProgress?: (percent: number) => void
) {
  return await new Promise((resolve, reject) => {
    // using the old XHR here instead of fetch, so we have a progress callback
    // without invoking something heavier like axios
    const xhr = new XMLHttpRequest()

    xhr.addEventListener('readystatechange', (e) => {
      // @ts-ignore - readyState type is broken here
      if (e.target?.readyState === 4) {
        resolve(xhr.response)
      }
    })
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        if (event.loaded === event.total) {
          onProgress?.(99)
        } else {
          const percent = Math.round((event.loaded * 100) / event.total)
          onProgress?.(percent)
        }
      }
    })
    xhr.onerror = (e) => {
      reject(e)
    }
    xhr.open('PUT', path, true)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.send(file)
  })
}
