#include <QtGui>
#include <QtWebKit>
#include "mainwindow.h"
#include "loggingwebpage.h"
#include "clearingwebview.h"

MainWindow::MainWindow(const QUrl& url)
{
	startUrl = url;
	
	QNetworkProxyFactory::setUseSystemConfiguration(true);
	
	QWebSettings::globalSettings()->setAttribute(QWebSettings::LocalContentCanAccessRemoteUrls, true);
	
	view = new ClearingWebView(this);
	setCentralWidget(view);
	
	view->setPage(new LoggingWebPage());
	
    // make the web view not draw its background, so a transparent
    // area on the web page lets other DirectFB layers shine through
	QPalette palette = view->palette();
	palette.setBrush(QPalette::Base, Qt::transparent);
	view->page()->setPalette(palette);
	view->setAttribute(Qt::WA_OpaquePaintEvent, false);
	
	// don't show scrollbars
	view->page()->mainFrame()->setScrollBarPolicy( Qt::Vertical, Qt::ScrollBarAlwaysOff ); 
	view->page()->mainFrame()->setScrollBarPolicy( Qt::Horizontal, Qt::ScrollBarAlwaysOff );
	
	view->load(startUrl);
}

void MainWindow::reload()
{
	view->load(startUrl);
	view->reload();
}

