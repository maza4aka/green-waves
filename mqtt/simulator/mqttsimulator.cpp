#include "mqttsimulator.h"

MqttSimulator::MqttSimulator(QTextBrowser **log, QObject *parent)
    :
    QObject(parent), log(log)
{
    client.setKeepAlive(60);
    client.setPort(8883);

    connect(&client, &QMqttClient::connected, this, &MqttSimulator::on_connect);
}

MqttSimulator::~MqttSimulator()
{
    disconnect(&client, &QMqttClient::connected, this, &MqttSimulator::on_connect);
}

void MqttSimulator::on_connect()
{
    LOG("Connected!\n");
    LOG("Status: " + QString::number(client.state()) + "\n");

    topic = QMqttTopicName("/devices/ambulance0/events");
}

bool MqttSimulator::send_next_data()
{
    LOG("Sending data: " + data.first());

    client.publish(topic, data.first().toUtf8(), 0, false);
    LOG("...sent!\n");

    data.pop_front();
    if (!data.count()) {
        LOG("Done!\n");

        client.disconnectFromHost();
        LOG("Disconnected...\n");
    } else {
        LOG("Remaining data count: " + QString::number(data.count()) + "\n");
    }

    return data.size();
}

void MqttSimulator::connect_mqtt(QByteArray jwt, QString data, QString root_ca)
{
    sslConf.setCaCertificates(QSslCertificate::fromPath(root_ca));

    this->data = data.split(';');

    client.setPassword(jwt);
    client.connectToHostEncrypted(sslConf);
}

QByteArray MqttSimulator::createJWT(QString interpreter, QStringList arguments)
{
    script.start(interpreter, arguments);
    script.waitForFinished(-1);

    return script.readAllStandardOutput();
}

void MqttSimulator::setClient(QString id)
{
    client.setClientId(id);
}

void MqttSimulator::setHost(QString name)
{
    client.setHostname(name);
}
