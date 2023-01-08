# DataQuota
## Simple создание и отладка Spark приложений

## Установка

Скачать
**github user:** DataLA-sys
**read-only token:** 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

В папке dist готовое приложение

Запуск

Перейти в папку dist

```
java -Dconfig.file=./application.conf -jar dataquote-assembly-0.1.0-SNAPSHOT.jar
```

В браузере
http://localhost:8083/

При первом запуске запросит
**логин:** admin
**пароль:** admin

## Описание

Spark приложение, это

Исполняемая PySpark программа: 
```
/dist/quarryProjects/q.py
```
q.py читает json конфигурацию приложения. 
Находит и устанавливает порядок следования step.
Интерполирует строки.
Устанавливает, до какого именно step будет идти исполнение. До конца, или до определенного step в случае отладки.
Определяет, что вернуть - ничего, scheme dataset указанного step, или вернуть sample data указанного step.
Читает SQL скрипты каждого step.
Запускает исполнение.

Файл json конфигурации, в котором вся логика приложения, а именно - описание всех step и поряк их следования друг за другом:
```
/dist/quarryProjects/[проект]/[проект].json
```

Папка SQL скриптов приложения:
```
/dist/quarryProjects/[проект]/scripts
```

Вместе с приложением идет учебный проект example1

Чтобы создать spark приложение, необходимо:
- создать step
![plot](./doc/pic/newstep.png)

step могут быть источники данных (source), sql, приемник данных (target)

- указать их типы и свойства
![plot](./doc/pic/stepprops.png)

для источников и приемников их свойста. для sql ссыла на файл sql.

- связать их друг с другом
![plot](./doc/pic/steplinks.png)

для step указываются входящие для них. Они доступны в sql по названию

- указать sql
![plot](./doc/pic/stepsql.png)
![plot](./doc/pic/gosql.png)
![plot](./doc/pic/sql.png)

- отладить
![plot](./doc/pic/debug.png)

справа вверху можно указать environment если их несколько. здесь запускается spark-submit и показываются логи 
