#include "sighandler.h"
#include <QApplication>
#include "mainwindow.h"

int SigHandler::sigFd[2];

int SigHandler::setup(int s)
{
	struct sigaction sa;
	
	sa.sa_handler = SigHandler::signalHandler;
	sigemptyset(&sa.sa_mask);
	sa.sa_flags |= SA_RESTART;
	
	if (sigaction(s, &sa, 0) > 0) {
		return 1;
	}
	
	return 0;
}

void SigHandler::signalHandler(int s)
{
	::write(sigFd[0], &s, sizeof(s));
}



SigHandler::SigHandler(QObject *parent) : QObject(parent)
{
	if (::socketpair(AF_UNIX, SOCK_STREAM, 0, sigFd)) {
		qFatal("Couldn't create socketpair");
	}
	
	sn = new QSocketNotifier(sigFd[1], QSocketNotifier::Read, this);
	connect(sn, SIGNAL(activated(int)), this, SLOT(handleSignal()));
}

SigHandler::~SigHandler()
{
}

void SigHandler::handleSignal()
{
	sn->setEnabled(false);
	int s;
	::read(sigFd[1], &s, sizeof(s));
	qDebug("Got SIGNAL %d", s);
	
	// do Qt stuff
	switch (s) {
		case SIGHUP: {
			QWidget *w = qApp->activeWindow();
			if (w != 0 && w->inherits("MainWindow")) {
				((MainWindow *)w)->reload();
			}
			}
			break;
			
		default:
			qDebug("Closing app cleanly");
			qApp->closeAllWindows();
			break;
	}
	
	sn->setEnabled(true);
}
