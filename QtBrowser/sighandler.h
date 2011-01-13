#include <QObject>
#include <QSocketNotifier>

#include <signal.h>
#include <sys/socket.h>
#include <unistd.h>

class SigHandler : public QObject
{
	Q_OBJECT

public:
	SigHandler(QObject *parent = 0);
	~SigHandler();
	
	static int setup(int s);
	
	// Unix signal handlers.
	static void signalHandler(int s);
	
public slots:
	// Qt signal handlers.
	void handleSignal();
	
private:
	static int sigFd[2];
	QSocketNotifier *sn;
};

