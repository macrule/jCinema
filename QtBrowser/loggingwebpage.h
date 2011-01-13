#include <QtWebKit>

class LoggingWebPage : public QWebPage {
	Q_OBJECT
public:
	LoggingWebPage(QObject * parent = 0) : QWebPage(parent) {}
protected:
	void javaScriptConsoleMessage(const QString& message, int lineNumber, const QString& sourceID) {
		QString logEntry = message +" on line:"+ QString::number(lineNumber) +" Source:"+ sourceID;
		qDebug()<<logEntry;
	}
};
