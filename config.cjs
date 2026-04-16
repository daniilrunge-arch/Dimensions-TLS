module.exports = {
    enabled: true,
    joinLeaveMessages: true,
    nameColor: "FFFFFF",
    chatColor: "FFFFFF",
    
    servers: {
        "lobby": "[c/32ff7e:(Лобби)]",
        "survival": "[c/32ff7e:(Выживание)]"
    },

    // Все доступные группы и их оформление
    groups: {
        "guest": "[c/AAAAAA:Гость]",
        "player": "[c/00FFFF:Игрок]",
        "vip": "[c/FFD700:VIP]",
        "epic": "[c/BF00FF:Epic]",
        "legend": "[c/FF4500:Legend]",
        "builder": "[c/32CD32:Builder]"
    },

    // Команды, которые дают статус "player" на текущем сервере
    authCommands: ["/register", "/login"],

    // Ручные префиксы (для Создателя/Админа - работают везде)
    prefixes: {
        "nene": "[c/FF0000:Создатель]"
    }
};