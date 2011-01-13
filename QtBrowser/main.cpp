#include <QtGui>
#include <QWSServer>
#include "mainwindow.h"
#include "sighandler.h"

int main(int argc, char * argv[])
{
	// we must install a signal handler that cleanly quits the app
	// and deinitializes DirectFB, because the WDTV driver doesn't
	// do it. If we miss this, there is no way to start any DirectFB
	// app more than twice due to leaked video memory.
	if (SigHandler::setup(SIGINT) != 0 ||
	    SigHandler::setup(SIGTERM) != 0 ||
	    SigHandler::setup(SIGHUP) != 0) {
		qFatal("SigHandler::setup() failed");
		return -1;
	}
	
	QApplication app(argc, argv);
	SigHandler sh;
	
	QUrl url;
	if (argc > 1) {
		url = QUrl(argv[argc - 1]);
	} else {
		url = QUrl("http://www.google.com/ncr");
	}
	
	QWSServer::setCursorVisible(false);
	QWSServer::setBackground(QBrush(Qt::transparent));
	
	MainWindow *browser = new MainWindow(url);
	
	// make sure that the browser is translucent, so that videos
	// on a different DirectFB layer can show through.
	browser->setAttribute(Qt::WA_TranslucentBackground, true);
	
	browser->showFullScreen();
	
	return app.exec();
}
