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
  Loaded = "Loaded",
  Started = "Started",
  Active = "Active",
  Hangup = "Hangup"
}

class Logger {
    public info(message: string): void {
        return this.baseLog(`${Color.Green}${message}`)
      }

  public log(action: Action, tabIndex?: number, tabUid?: string): void {
    return this.baseLog(`${this.getActionColor(action)}${action}`, tabIndex, tabUid)
  }

  public error(message: any, tabIndex?: number, tabUid?: string) {
    return this.baseLog(`${Color.Red}${message}`, tabIndex, tabUid)
  }

  private baseLog(message: string, tabIndex?: number, tabUid?: string): void {
    const tabInfo = tabIndex && tabUid ? `${Color.White}#${this.padZeros(tabIndex)}${Color.Yellow}[${tabUid.slice(0, 10)}] ` : ""
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
      case Action.Loaded:
        return Color.Magenta
      case Action.Started:
        return Color.Blue
      case Action.Active:
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
