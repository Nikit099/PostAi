import { useState, useEffect } from 'react'

interface BatteryStatus {
  level: number | null // от 0 до 1
  charging: boolean | null
  chargingTime: number | null // в секундах
  dischargingTime: number | null // в секундах
  supported: boolean
}

export function useBattery(): BatteryStatus {
  const [status, setStatus] = useState<BatteryStatus>({
    level: null,
    charging: null,
    chargingTime: null,
    dischargingTime: null,
    supported: false,
  })

  useEffect(() => {
    // Проверяем поддержку Battery Status API
    if (!('getBattery' in navigator)) {
      setStatus(prev => ({ ...prev, supported: false }))
      return
    }

    let battery: any = null

    const updateBatteryStatus = () => {
      if (!battery) return

      setStatus({
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
        supported: true,
      })
    }

    const handleBatteryEvents = () => {
      if (!battery) return

      battery.addEventListener('levelchange', updateBatteryStatus)
      battery.addEventListener('chargingchange', updateBatteryStatus)
      battery.addEventListener('chargingtimechange', updateBatteryStatus)
      battery.addEventListener('dischargingtimechange', updateBatteryStatus)
    }

    const initBattery = async () => {
      try {
        battery = await (navigator as any).getBattery()
        updateBatteryStatus()
        handleBatteryEvents()
      } catch (error) {
        console.error('Ошибка при получении информации о батарее:', error)
        setStatus(prev => ({ ...prev, supported: false }))
      }
    }

    initBattery()

    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', updateBatteryStatus)
        battery.removeEventListener('chargingchange', updateBatteryStatus)
        battery.removeEventListener('chargingtimechange', updateBatteryStatus)
        battery.removeEventListener('dischargingtimechange', updateBatteryStatus)
      }
    }
  }, [])

  return status
}