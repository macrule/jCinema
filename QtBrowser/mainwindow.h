#include <QtGui>

class QWebView;
QT_BEGIN_NAMESPACE
class QLineEdit;
QT_END_NAMESPACE

class MainWindow : public QMainWindow
{
	Q_OBJECT

public:
	MainWindow(const QUrl& url);
	
	void reload();
	
protected slots:
	
private:
	QUrl startUrl;
	QWebView *view;
};
