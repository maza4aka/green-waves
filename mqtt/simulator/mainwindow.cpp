#include "mainwindow.h"
#include "ui_mainwindow.h"

MainWindow::MainWindow(QWidget *parent)
    :
    QMainWindow(parent),
    ui(new Ui::MainWindow),
    ms(&ui->console)
{
    ui->setupUi(this);
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::on_send_clicked()
{
    ui->send->setEnabled(ms.send_next_data());

    if (!ui->send->isEnabled()) {
        ui->submit->setEnabled(true);
        ui->jsonInputArea->setEnabled(true);
    }
}

void MainWindow::on_submit_clicked()
{
    ui->submit->setEnabled(false);
    ui->jsonInputArea->setEnabled(false);

    ms.setClient("projects/" + ui->project_id_string->text().trimmed()
               + "/locations/" + ui->region_string->text().trimmed()
               + "/registries/" + ui->registry_id_string->text().trimmed()
               + "/devices/" + ui->device_id_string->text().trimmed()
                 );
    ms.setHost(ui->broker_url_string->text().trimmed());

    ms.connect_mqtt(ms.createJWT(
                        ui->interpreter_path->text(),
                        ui->arguments_string->text().split(' ')),
                    ui->jsonInputArea->toPlainText(),
                    ui->root_ca_path->text()
                    );

    ui->send->setEnabled(true);
}
