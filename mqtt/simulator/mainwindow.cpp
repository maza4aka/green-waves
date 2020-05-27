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

void MainWindow::on_publish_clicked()
{
    ms.setClient("projects/" + ui->project_id_string->text().trimmed()
               + "/locations/" + ui->region_string->text().trimmed()
               + "/registries/" + ui->registry_id_string->text().trimmed()
               + "/devices/" + ui->device_id_string->text().trimmed()
                 );
    ms.setHost(ui->broker_url_string->text().trimmed());

    ms.publish_data(ms.createJWT(
                        ui->interpreter_path->text(),
                        ui->arguments_string->text().split(' ')),
                    ui->jsonInputArea->toPlainText(),
                    ui->root_ca_path->text()
                    );
}
