enum Color {
  Reset = "\x1b[0m",
  Red = "\x1b[31m",
  Green = "\x1b[32m",
  Yellow = "\x1b[33m",
  Blue = "\x1b[34m",
  Magenta = "\x1b[35m",
  Cyan = "\x1b[36m",
  White = "\x1b[37m",
  DarkBlue = "\x1b[94m"
}

export enum Action {
  Started = "Started",
  Success = "Success",
  Hangup = "Hangup"
}

class Logger {
  public info(message: string): void {
    return this.baseLog(`${Color.Green}${message}`)
  }

  public log(action: Action, bId?: number, pagesCount?: number): void {
    const count = pagesCount ? `[${pagesCount} pages]` : ""
    return this.baseLog(`${this.getActionColor(action)}${action} ${count}`, bId)
  }

  public error(message: any, bId?: number) {
    return this.baseLog(`${Color.Red}${message}`, bId)
  }

  private baseLog(message: string, bId?: number): void {
    const tabInfo = bId !== undefined ? `${Color.Yellow}#${bId + 1} ` : ""
    // eslint-disable-next-line no-console
    console.log(`${this.getDate()} ${tabInfo}${message}`)
  }

  private getDate(): string {
    const today = new Date()
    const date = `${this.padZeros(today.getDate())}.${this.padZeros(today.getMonth() + 1)}.${this.padZeros(
      today.getFullYear()
    )}`
    const time = `${this.padZeros(today.getHours())}:${this.padZeros(today.getMinutes())}:${this.padZeros(
      today.getSeconds()
    )}`

    return `${Color.Cyan}${date} ${time}`
  }

  private getActionColor(action: Action): Color {
    switch (action) {
      case Action.Started:
        return Color.Magenta
      case Action.Success:
        return Color.Green
      case Action.Hangup:
        return Color.Red
    }
  }

  private padZeros(value: number, chars = 2) {
    if (value.toString().length < chars) {
      const zeros = chars - value.toString().length
      const str = new Array(zeros).fill(0)
      return `${str.join("")}${value}`
    }

    return value.toString()
  }
}

export default new Logger()
