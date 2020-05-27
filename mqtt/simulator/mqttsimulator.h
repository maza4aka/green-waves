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

    void publish_data(QByteArray jwt, QString data, QString root_ca);
    QByteArray createJWT(QString interpreter, QStringList arguments);
    void setHost(QString name);
    void setClient(QString id);

    void on_connect();
private:
    QMqttClient client;

    QSslConfiguration sslConf;
    QTextBrowser **log;
    QProcess script;

    QString data;
};

#endif // MQTTSIMULATOR_H
