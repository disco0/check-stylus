import os from 'os'

export const isDarwin = (): boolean => os.platform() === 'darwin'
export const isWindows = (): boolean => os.platform() === 'win32'