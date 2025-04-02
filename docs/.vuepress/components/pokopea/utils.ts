/** 格式化日期 接收参数格式："2018-02-01T15:12:38Z". 返回格式：18-02-01*/
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    let year = date.getFullYear().toString().slice(-2)
    let month = (date.getMonth() + 1).toString().padStart(2, '0')
    let day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
};

/** 格式化时长. 接收参数格式："PT2M4S"， 返回格式：02:04 */
const formatDuration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return "00:00"
    const hours = match[1] || ''
    const minutes = (match[2] || '').padStart(2, '0')
    const seconds = (match[3] || '').padStart(2, '0')
    return [hours, minutes, seconds].filter(v => v).join(':')
}

export {
    formatDate,
    formatDuration,
}