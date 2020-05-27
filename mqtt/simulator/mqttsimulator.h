#ifndef MQTTSIMULATOR_H
#define MQTTSIMULATOR_H

#include <QObject>
#include <QTextBrowser>
#include <QProcess>
#include <QSslConfiguration>
#include <QtMqtt>

class MqttSimulator : public QObject
{
    Q_OBJECT
public:
    explicit MqttSimulator(QTextBrowser **log, QObject *parent = nullptr);
    ~MqttSimulator();

    void connect_mqtt(QByteArray jwt, QString data, QString root_ca);
    bool send_next_data();

    QByteArray createJWT(QString interpreter, QStringList arguments);

    void setHost(QString name);
    void setClient(QString id);

    void on_connect();
private:
    QMqttClient client;

    QMqttTopicName topic;
    QSslConfiguration sslConf;
    QTextBrowser **log;
    QProcess script;

    QStringList data;
};

#define LOG( args ) (*log)->append(args)

#endif // MQTTSIMULATOR_H
